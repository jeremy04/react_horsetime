class AddManagerToGames < ActiveRecord::Migration[5.1]
  def change
    add_reference :games, :player
  end
end
