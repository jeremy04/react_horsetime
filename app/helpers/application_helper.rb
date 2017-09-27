module ApplicationHelper
  USER_AGENT_PARSER = UserAgentParser::Parser.new

  def is_mobile?
    user_agent = USER_AGENT_PARSER.parse(request.user_agent)
    user_agent.family == "Chrome Mobile WebView"
  end

end
