module Api
  module V1
    class LinksController < ApiController
      WithUser

      def create
        link = Shortener::ShortenedUrl.create(link_params)
        if link.save
          render json: link
        else
          render json: link, status: :bad_request
        end
      end

      def link_params
        params['link'].permit(
          :url
        ).merge({
          owner: get_user
        })
      end

    end
  end
end