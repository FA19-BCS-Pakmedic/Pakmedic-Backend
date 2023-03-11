module.exports = {
  type: process.env.DIALOGFLOW_API_type,
  project_id: process.env.DIALOGFLOW_API_project_id,
  private_key_id: process.env.DIALOGFLOW_API_private_key_id,
  private_key: process.env.DIALOGFLOW_API_private_key,
  client_email: process.env.DIALOGFLOW_API_client_email,
  client_id: process.env.DIALOGFLOW_API_client_id,
  auth_uri: process.env.DIALOGFLOW_API_auth_uri,
  token_uri: process.env.DIALOGFLOW_API_token_uri,
  auth_provider_x509_cert_url:
    process.env.DIALOGFLOW_API_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.DIALOGFLOW_API_client_x509_cert_url,
};
