# frozen_string_literal: true

class RedirectController < ActionController::Metal
  include ActionController::StrongParameters
  include ActionController::Redirecting
  include ActionController::Instrumentation
  include AbstractController::Rendering
  include ActionView::Rendering
  include ActionController::Rendering
  include Rails.application.routes.url_helpers
  include Shortener
  include WithUser

  def show

    token = ::Shortener::ShortenedUrl.extract_token(params[:id])
    track = Shortener.ignore_robots.blank? || request.human?
    url   = ::Shortener::ShortenedUrl.fetch_with_token(token: token, additional_params: params, track: track)
    allowed_users_ids = ShortenedUrlsUser.where(shortened_url_id: url[:id]).pluck(:user_id)
    if allowed_users_ids
      allowed_users_ids << current_user.id if current_user
      if !current_user || !allowed_users_ids.include?(current_user.id)
        render plain: 'permission denided', status: :forbidden
      else
        redirect_to url[:url], status: :moved_permanently
      end
    else
      Rails.logger.info(url)
      redirect_to url[:url], status: :moved_permanently
    end
    # render plain: url[:url]
  end
end
