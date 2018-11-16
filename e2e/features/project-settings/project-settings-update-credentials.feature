Feature: project-settings-update-credentials

  Scenario: project-settings-update-credentials
    Given [common] scenario 'project-settings-update-credentials'    
    
    Then [common] I go to '/project/futurama/settings'
    Then [common] I am on page with url '/project/futurama/settings'
    
    
    Then [common] I click 'projectSettingsUpdateCredentials'
    
    Then [common] I enter json into field 'projectSettingsUpdateCredentialsDialogInput' value
      """
{
  "type": "service_account",
  "project_id": "flow-1202",
  "private_key_id": "d3504c9c1e1d158cd3510b30ec1eb42ee7635aeb",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCt1NIG2dhK7CbV\ndwW9+PNKHlJyFKHP0HflI2U3w9a+t4kSps3KpVxNlj7rgFpPX8HnnpuGK5EC3k6w\nDWB+7ECJ9njinl8DrjRKRmeYsTASp8KvAKktNqAK4cNMhYYvUafSxHhf3jCxwkge\nQVg7O78Niw6q8MkF0+2bDKKRyrXVsFMTDd9NJy5/9JW/3FscKdUhZcFrYCAn/jrp\nQfx7TRIOuSKgmSMPGNAo56+q5SEB6siymyVrGYpA9hf/c+WBdJe6+BBPJNrXfGIt\n5UMMhMQwk3FKGnnt42u2THk77tBcBkEvCus30fe8DWGG66x5TZe9xhwCFDwu/sX1\nIzstdFklAgMBAAECggEAIwVq8PVnpaSRKFWL4xuqTEbynkg412jtFs18QXFjrNXG\nOGtBr6+D+p+n+oNH7pDgvHzQYYYad4T5Pm/bfoazc/gjn6h/hPrOTx6DFZixEjkZ\nOG++Jb1JHhgg5CRMhfECCi0KAWp+zflR1UKd94UQdzaKVHchUNrDFodDo3K/EpdX\nL4e9syGn6vQF038EW867DG3eW68EZ4zBwcm9NFdu7v7DYNovH2lpEdyqM+YdUd3H\noggYrRM8FggkWbHGq3It5n+/ZgWOvo5n9j9I/g+IpRRXIkZsNX+RBpARUL/3x4af\nij5/LVJedkE1U+WE8k7rtP3RwupDWsHT/cw5wqaauwKBgQDzSAPvQuUEhSoqnMYO\niQne+cT/RLJ+o754cr1zt/tLfD4P2YUIq/pWiyIutMSUNzxK2lvD3D7N3EWgCpz4\nOgjF/VY+jIgTcwcp0JfKZAJYesnnsIAPtpuyC8+OrLLvbLigiYFrlMEH0f4V9xf0\nKslpzbnfrDPeQRqBl1RJidcFAwKBgQC261AZ7B8RvdVeJW0u4liDAuXB79HvSyBk\nbSmmPfhlzdhu0GTFSbMeoQstGA0oLIZ2or/bX+CKK9FLzTTW0oxlPNHba5ipzYrR\npjqSganag9AbLbaO3L+gCA5164deTYjg3+WMZfiePJDDI+R+iob4nEmlEbbyfGBc\nOM9yZwvstwKBgQDHhsrjUqPuHyFELawqg6461/L/wWH7h2RR+Rj0bXKGqHFmImp/\ngD0i+Z2hXNTVErA6W/hjHKHNyNi5t7qhw0cqyuoPBscb3H2Fh/TWI0vhMWOiyBlf\nyc7MKe+i/nUK9Mo/sEca6reeKFYRwcQ9l1H1mqrVjbBEmnSY0Hpqjchx7QKBgQCX\ndUZxAGNFdHMMrl62eHKjoC2QJLwmsIUUwpK+9QcNfKEeOG2IMhsfXGd9ojGatytr\nZh0IT14D6n41jqeWzOW1GeQGFBRnXSr5pvNOxhBXP9d7+aD0r/H3V1Rp7Wi7++U/\nlgRi+TggBbQz8C9NW/SgPAB6rq1WIQhEtEGIz6w/BwKBgDp9wmuWbBP2zeqAbR0D\nfHPozKuSTCIcGf1xyPGfpktnwN0BR17RVTfuIUFKBpN8Kyu4q7Rose1rvWvutoVi\nrj63JIYLU/QhcQ8VCXS/XqenzzaIW27DndTondk7TFK0ofR0wbavxhcQhBDHJwY3\nygOJd/yph3Y+UT1lAHsCyliZ\n-----END PRIVATE KEY-----\n",
  "client_email": "flow-futurama-bq-2018@flow-1202.iam.gserviceaccount.com",
  "client_id": "107662200208382417248",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/flow-futurama-bq-2018%40flow-1202.iam.gserviceaccount.com"
}
      """
    
    Then [common] I click 'projectSettingsUpdateCredentialsDialogSave'

    Then [common] I wait "1" seconds

    Then [common] I click 'projectSettingsTitle'
    
    Then [common] Field 'projectSettingsBqProject' row '0' attribute 'innerText' should be 'flow-1202'
    Then [common] Field 'projectSettingsClientEmail' row '0' attribute 'innerText' should be 'flow-futurama-bq-2018@flow-1202.iam.gserviceaccount.com'
