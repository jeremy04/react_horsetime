class Game < ActiveRecord::Base
  has_many :players
  
  def matchup
    "#{home_team} vs. #{away_team}"
  end

  def manager
    if player_id
      Player.find(player_id)
    else
      nil
    end
  end

  # Empty manager not allowed
  def manager=(player)
    if player.try(:id)
      self.player_id = player.id
    end
  end

  def self.list(user)
    user_sql = sanitize_sql_array(['"users"."id" = ?', user.id])
    query = <<-SQL
    LEFT OUTER JOIN "players" ON "players"."game_id" = "games"."id" 
    LEFT OUTER JOIN "users" ON "users"."id" = "players"."user_id" AND #{user_sql}
    SQL
    self.joins(query).select('"games".*, "users"."id" as joined_game')
  end
end
