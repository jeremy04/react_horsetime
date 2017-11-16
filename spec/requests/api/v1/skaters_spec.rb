require "rails_helper"

RSpec.describe "Skaters API", :type => :request do
  let(:headers) do
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  end

  # TODO: fake out this with VCR
  it "returns skaters" do
    Game.create!(puck_drop_at: Time.now, room_code: "ABCD", nhl_game: "2017020047", home_team: "Washington Capitals", away_team: "Pittsburgh Penguins") 
    get('/api/v1/rooms/ABCD/skaters/season_stats', { headers: headers })
    json = JSON.parse(response.body)
    expect(response).to have_http_status(200)
    expect(json["skaters"].size).to be > 0
    expect(json["skaters"].first.keys).to eql ["name", "goals", "assists", "points", "team", "location"]
  end

  it "only includes undrafted" do
    game = Game.new(puck_drop_at: Time.now, room_code: "ABCD", nhl_game: "2017020047", home_team: "Washington Capitals", away_team: "Pittsburgh Penguins") 
    game.save!
    user = User.create!(email: "woo@woo.com", password: "test123", password_confirmation: "test123")
    game.players << Player.new(name: "djWOOO", game: game, user: user, horses: { home_team: ["Sidney Crosby"] })
    game.save!

    get('/api/v1/rooms/ABCD/skaters/season_stats', { headers: headers })
    json = JSON.parse(response.body)
    expect(json["skaters"].select { |skater| skater["name"] == "sidney crosby" }.size).to be == 0
 
  end

  it "returns error when Game is not found" do
    get('/api/v1/rooms/ABCD/skaters/season_stats', { headers: headers })
    json = JSON.parse(response.body)
    expect(response).to be_not_found
    expect(json["errors"].first).to eql "Not Found"
  end
end
