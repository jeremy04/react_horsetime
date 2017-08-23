class AddUniqueIndexToPlayers < ActiveRecord::Migration[5.1]
  def change
    add_index :players, [:name, :game_id], unique: true
  end
end
