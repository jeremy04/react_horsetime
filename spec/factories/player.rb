FactoryBot.define do
  factory :player do
    sequence(:name, 100) { |n| "Player#{n}" }
    horses { { home_team: [], away_team: [] } }
  end
end
