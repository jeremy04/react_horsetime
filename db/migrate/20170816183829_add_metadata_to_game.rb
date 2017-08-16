class AddMetadataToGame < ActiveRecord::Migration[5.1]
  def change
    add_column :games, :nhl_game, :string, limit: 50, after: :status
    add_column :games, :home_team, :string, limit: 50, after: :gameId
    add_column :games, :away_team, :string, limit: 50, after: :home_team
    add_column :games, :puck_drop_at, :datetime, null: false
    remove_column :games, :matchup
  end
end
