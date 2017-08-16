class ActiveRoster

  def active_roster(game)
    live_roster_url = "https://statsapi.web.nhl.com/api/v1/game/#{game.game_id}/feed/live?site=en_nhl"
    json = HttpsGateway.get(url: live_roster_url)
    json = JSON.parse(json)
    players = json["gameData"]["players"].map { |p| p[1] }

    if roster_ready?(players)
      home_skaters = parse_live_skaters(players, game.home_team)
      away_skaters = parse_live_skaters(players, game.away_team)
    else
      # Game hasn't started yet
      # Use home id / away id , visit static roster
      home_team_id = json.dig("gameData","teams","home","id")
      away_team_id = json.dig("gameData","teams","away","id")
      static_roster_url = "https://statsapi.web.nhl.com/api/v1/teams?site=en_nhl&teamId=#{home_team_id},#{away_team_id}&expand=team.roster,roster.person,person.stats&stats=statsSingleSeason"

      json = HttpsGateway.get(url: static_roster_url)
      json = JSON.parse(json)
      home_skaters = parse_skaters(json, home_team_id)
      away_skaters = parse_skaters(json, away_team_id)
    end

    { home_team: home_skaters, away_team: away_skaters }
  end

  private

  def roster_ready?(players)
    players.size > 0
  end

  def parse_live_skaters(players, team)
    players = players.select { |p| p.dig("currentTeam","name")&.gsub('é','e') == team&.gsub('é','e') }
    players.map { |p| p["fullName"] }
  end

  def parse_skaters(json, id)
    team = json["teams"].select { |team| team["id"] == id }.first
    roster = team.dig("roster","roster")
    active_players = roster.select { |p| p.dig("person","primaryPosition","code") != "G" && p.dig("person","rosterStatus") != "I" }
    active_players.map { |p| p.dig("person","fullName") }
  end

end

