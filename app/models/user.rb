class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :timeoutable

  has_many :players
  has_many :games, through: :players


  def not_in_game?(game)
    self.games.where(id: game.id).first
  end

end
