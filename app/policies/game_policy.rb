# ** Attributes **
# user, current_user = current_user
# record = game

class GamePolicy < ApplicationPolicy
  def new?
    current_user.persisted?
  end

  def create?
    new?
  end

  def edit?
    create?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope
    end
  end
end
