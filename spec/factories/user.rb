FactoryBot.define do
  factory :user do
    sequence(:email, 1000) { |n| "person#{n}@example.com" }
    password 'test123'
    password_confirmation 'test123'
    trait :guest do
      guest true
    end
  end
end
