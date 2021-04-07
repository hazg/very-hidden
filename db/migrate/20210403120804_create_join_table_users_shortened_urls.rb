class CreateJoinTableUsersShortenedUrls < ActiveRecord::Migration[6.1]
  def change
    create_join_table :users, :shortened_urls do |t|
      t.index [:user_id, :shortened_url_id]
    end
  end
end
