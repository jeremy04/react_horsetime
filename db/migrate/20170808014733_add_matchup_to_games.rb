class AddMatchupToGames < ActiveRecord::Migration[5.1]
  def change
    add_column :games, :matchup, :string, limit: 80, after: :status
  end
end
