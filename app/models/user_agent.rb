class UserAgent
  USER_AGENT_PARSER = UserAgentParser::Parser.new

  def self.user_agent_parser
    USER_AGENT_PARSER
  end
end
