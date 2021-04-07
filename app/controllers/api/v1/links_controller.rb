module Api
  module V1
    class LinksController < ApiController
      WithUser

      def create
        urls = link_params[:url].split("\n")

        links = urls.map do |url|
          create_link(url, link_params)
        end
        Rails.logger.debug('**************************')
        Rails.logger.debug(links)
        Rails.logger.debug('**************************')
        users = User.where(id:
          link_params[:users].map do |u|
            u[:value]
          end
        )
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
        params['link'].permit(
          :url, users: ['value', 'label']
        ).merge({
          owner: get_user
        })
      end

    end
  end
end