require 'uri'
require 'net/https'

class HttpsGateway
  def self.get(url: )
    ssl_args = { use_ssl: true, ssl_version: :TLSv1_2, verify_mode: OpenSSL::SSL::VERIFY_PEER }
    uri = URI(url)
    response = Net::HTTP.start(uri.host, uri.port, ssl_args) do |http|
      request = Net::HTTP::Get.new(uri)
      http.request(request)
    end
    response.body
  end
end
