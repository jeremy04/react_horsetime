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
    expect(response).to be_success
    expect(json["skaters"].size).to be > 0
    expect(json["skaters"].first.keys).to eql ["name", "goals", "assists", "points", "team", "location"]
  end

  it "returns error when Game is not found" do
    get('/api/v1/rooms/ABCD/skaters/season_stats', { headers: headers })
    json = JSON.parse(response.body)
    expect(response).to be_not_found
    expect(json["errors"].first).to eql "Not Found"
  end
end
