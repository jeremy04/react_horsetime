class CreateGames < ActiveRecord::Migration[5.1]
  def change
    enable_extension 'citext'

    create_table :games do |t|
      t.citext :room_code, null: false
      t.datetime :expires_on
      t.integer :pick_number
      t.boolean :ready
    end
  end
end
