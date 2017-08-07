class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.string :name
      t.jsonb :horses, null: false, default: '{}'
      t.references :game, index: true, null: false
    end
    add_foreign_key :players, :games
    add_index :players, :horses, using: :gin
  end
end
