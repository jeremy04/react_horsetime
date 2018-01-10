require "rails_helper"

describe DraftSchema do

  let(:game) { create(:game) }

  it "succeeds with no horses present" do
    params = { 
      room_code: game.room_code, 
      choice: "Sidney Crosby", 
      team: "away_team", 
      horses: { away_team: [], home_team: [] }, 
      game_id: game.id 
    }   
    
    schema = DraftSchema.call(params) 
    expect(schema.success?).to be true
  end

  it "fails with max size horses limit reached" do
    
    params = { 
      room_code: game.room_code, 
      choice: "Something Else", 
      team: "away_team", 
      horses: { away_team: ['Something Else', 'Evgeni Malkin', 'Kris Letang'], home_team: [] }, 
      game_id: game.id 
    }   

    schema = DraftSchema.call(params.with_indifferent_access) 
    expect(schema.success?).to be false
 
  end

end
