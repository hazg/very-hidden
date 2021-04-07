# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApiController
      include WithParams
      def index
        email = user_params[:email]
        if email.present?
          render plain: users_to_select(User.where('email LIKE ?', "%#{email}%").all), content_type: 'application/json'
        else
          render plain: users_to_select(User.all), content_type: 'application/json'
        end
      end

      def info
      end


      private

      def users_to_select(users)
        users.map{|x|
          {
            value: x.id,
            label: x.email
          }
        }.to_json
      end
        #Ex:- add_index("admin_users", "username")
      # def register
      #   user = User.create(user_params)
      #   if user.save!
      #     render json: user
      #   else
      #     render errors: user.full_message, status: bad_request
      #   end
      # end


      def user_params
        params.permit(
          :email,
          :password,
          :password_confirmation,
          :session
        ).merge( # add User id and In-processing status
          {
          }
        )
      end

    end
  end
end
