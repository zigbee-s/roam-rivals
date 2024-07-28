To generate an APK from above code:

Use below commands:
Login to expo using below command:

Open terminal as administrator and run below command in UI directory:

npm install -g expo-cli
expo login
npm install -g eas-cli
eas build:configure
eas build -p android --profile production


After building aab file is created:
Dowmload bundletool-all-1.17.1.jar from google

create a keystore file:
keytool -genkey -v -keystore your-keystore-file.jks -keyalg RSA -keysize 2048 -validity 10000 -alias your-key-alias

java -jar bundletool-all-1.17.1.jar build-apks --bundle=C:/Users/risha/Downloads/application-0eb13a68-d173-4e10-81b3-faf23135f49c.aab --output=roamrival.apks --mode=universal

java -jar bundletool-all-1.17.1.jar extract-apks --apks=roamrival.apks --output-dir=C:\Users\risha\OneDrive\Desktop\RoamRival\roam-rivals\roamrivals --device-spec=device-spec.json

C:\Users\risha\AppData\Local\Android\Sdk\build-tools\30.0.3\apksigner sign --ks my-release-key.keystore --ks-key-alias my-key-alias --ks-pass pass:rishabh --key-pass pass:rishabh universal.apk

adb install universal.apk