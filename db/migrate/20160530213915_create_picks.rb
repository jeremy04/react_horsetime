class CreatePicks < ActiveRecord::Migration
  def change
    create_table :picks do |t|
      t.references :player, index: true, null: false
      t.references :game, index: true, null: false
      t.integer :pick_number
      t.datetime :expires_on
    end
    add_foreign_key :picks, :games
    add_foreign_key :picks, :players
  end
end
