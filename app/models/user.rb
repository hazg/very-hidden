class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
  :recoverable, :rememberable, :trackable, :validatable
  include DeviseTokenAuth::Concerns::User
  has_and_belongs_to_many :shortened_urls, class_name: 'Shortener::ShortenedUrl'
end
