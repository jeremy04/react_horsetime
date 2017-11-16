FactoryBot.define do
  factory :game do
    sequence(:room_code, 1000)
    expires_on 5.hours.from_now
    puck_drop_at 1.hour.from_now
    nhl_game "2017020047"
    home_team "Washington Capitals"
    away_team "Pittsburgh Penguins"
    pick_number 1
  end
end
