class ApplicationController < ActionController::Base
  before_action :set_locale

  def set_locale
    I18n.locale = extract_locale_from_headers
  end

  def index
  end

  private
  ALLOWED_LOCALES = %w( en ru ru-RU ).freeze
  DEFAULT_LOCALE = 'en'.freeze

  def extract_locale_from_headers
    browser_locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
    if ALLOWED_LOCALES.include?(browser_locale)
      browser_locale
    else
      DEFAULT_LOCALE
    end
  end
end
