module Api
  module V1
    class ShortenedUrlsController < ApiController
      include WithUser
      include WithParams

      def index
        if(current_user)
          @pagy, @urls = pagy_with_params(Shortener::ShortenedUrl.where(owner: current_user), Shortener::ShortenedUrl)
          render json: {
            rows: @urls,
            headers: [
              {
                title: I18n.t('shortened_url.url')
              },
              {
                title: I18n.t('shortened_url.unique_key')
              }
            ],
            count: get_user.shortened_urls.count
          }
        end
      end

      def create
        urls = link_params[:url].split("\n")
        urls.reverse!()
        links = urls.map do |url|
          ActiveRecord::Base.transaction do
            create_link(url, link_params)
          end
        end
        Rails.logger.debug('**************************')
        Rails.logger.debug(links)
        Rails.logger.debug('**************************')
        users = link_params[:users] ? User.where(id:
          link_params[:users].map do |u|
            u[:value]
          end
        ) : []
        users.each{|u|
          u.shortened_urls << links
          u.save
        }
        if links.include?(false)
          render json: links, status: :bad_request
        else
          render json: links
        end

      end

      def create_link(url, params)
        link = Shortener::ShortenedUrl.create({url: url})

        link.owner = current_user if current_user

        if !link.save
          return false
        end
        return link
      end

      def link_params
        params['shortened_url'].permit(
          :url,  :page, :sort_by, :items, users: ['value', 'label']
        ).merge({
          owner: get_user
        })
      end

    end
  end
end