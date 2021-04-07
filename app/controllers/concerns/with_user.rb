module WithUser
  extend ActiveSupport::Concern
  include AbstractController::Callbacks # This adds before_filter
  include Devise::Controllers::Helpers # This adds current_user

  # Get current user.
  # Admins can simulate user by params['user_id'] parameter
  def get_user
    if(params['user_id'] && current_user.admin?)
      User.find(params['user_id'])
    else
      current_user
    end
  end

end
