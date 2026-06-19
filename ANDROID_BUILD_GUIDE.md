# Android App Build Guide via Capacitor

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
2. **Java JDK** (v17 or higher)
3. **Android Studio** (latest version)
4. **Android SDK** (API level 33 or higher)
5. **Gradle** (v8.0 or higher)

### Environment Setup
```bash
# Set JAVA_HOME environment variable
export JAVA_HOME=/path/to/jdk-17

# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk

# Add Android tools to PATH
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## Step 1: Install Dependencies

```bash
# Install Capacitor CLI
npm install @capacitor/cli @capacitor/core @capacitor/android

# Initialize Capacitor (if not already done)
npx cap init "UPSC by Nadiya" "com.upscnadiya.app"
```

## Step 2: Build Web App

```bash
# Build the React app for production
npm run build

# Verify build output
ls -la dist/
```

## Step 3: Add Android Platform

```bash
# Add Android platform
npx cap add android

# Sync web assets to Android
npx cap sync android
```

## Step 4: Configure Android App

### Update capacitor.config.json
```json
{
  "appId": "com.upscnadiya.app",
  "appName": "UPSC by Nadiya",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "launchAutoHide": true,
      "backgroundColor": "#8B5CF6",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false,
      "androidSpinnerStyle": "large",
      "spinnerColor": "#8B5CF6"
    },
    "LocalNotifications": {
      "smallIcon": "ic_stat_icon_config_sample",
      "iconColor": "#8B5CF6",
      "sound": "beep.wav"
    }
  },
  "android": {
    "buildOptions": {
      "keystorePath": "path/to/keystore.jks",
      "keystoreAlias": "release",
      "keystoreAliasPassword": "password",
      "keystorePassword": "password"
    }
  }
}
```

### Add App Icons
```bash
# Install capacitor assets plugin
npm install @capacitor/assets

# Generate app icons
npx capacitor-assets generate
```

## Step 5: Open in Android Studio

```bash
# Open project in Android Studio
npx cap open android
```

## Step 6: Configure Android Studio

### 1. Gradle Configuration
- Open `android/app/build.gradle`
- Update `minSdkVersion` to 24
- Update `targetSdkVersion` to 33
- Update `compileSdkVersion` to 33

### 2. Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 3. ProGuard Rules
Add to `android/app/proguard-rules.pro`:
```
-keep class io.github.razorpay.** { *; }
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile
-keepattributes LineTable
```

## Step 7: Generate Signing Key

```bash
# Generate keystore for release builds
keytool -genkey -v -keystore upsc-nadiya-release.keystore \
  -alias upsc-nadiya-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Store the keystore securely
# DO NOT commit keystore to version control
```

## Step 8: Build Release APK

### Using Android Studio
1. Build → Generate Signed Bundle/APK
2. Select APK or AAB
3. Select keystore file
4. Enter keystore password and alias
5. Select release variant
6. Build

### Using Command Line
```bash
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Step 9: Build Release AAB (for Play Store)

### Using Android Studio
1. Build → Generate Signed Bundle/APK
2. Select Android App Bundle
3. Select keystore file
4. Enter keystore password and alias
5. Select release variant
6. Build

### Using Command Line
```bash
cd android
./gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

## Step 10: Test the App

### Debug Build
```bash
# Connect Android device via USB
# Enable USB debugging on device
adb devices

# Install debug APK
npx cap run android
```

### Release Build Testing
```bash
# Install release APK on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Test all features
# - Login/Signup
# - Course enrollment
# - Video playback
# - Payment
# - Notifications
```

## Step 11: Play Store Submission

### 1. Create Google Play Console Account
- Go to https://play.google.com/console
- Create developer account ($25 one-time fee)
- Complete registration

### 2. Create App Listing
- App name: "UPSC by Nadiya"
- Short description: "Expert UPSC preparation with Nadiya Ma'am"
- Full description: (use TERMS_OF_SERVICE.md content)
- Screenshots: (5-8 screenshots required)
- Feature graphic: (1024x500px)
- App icon: (512x512px)

### 3. Upload AAB
- Go to Release → Production
- Upload app-release.aab
- Fill in content rating questionnaire

### 4. Add Privacy Policy URL
- Upload PRIVACY_POLICY.md to your website
- Add URL to Play Console

### 5. Add Content Rating
- Complete content rating questionnaire
- Get rating from IARC

### 6. Set Pricing & Distribution
- Free app
- Select countries
- Set distribution channels

### 7. Submit for Review
- Review takes 1-3 days
- Monitor status in Play Console
- Address any feedback

## Step 12: Post-Launch

### Monitor Performance
- Use Google Play Console analytics
- Track crash reports
- Monitor ANR (Application Not Responding)
- Track user reviews

### Update App
- Fix bugs
- Add features
- Update dependencies
- Increment version number
- Submit new AAB

### Rollback Plan
- Keep previous AAB version
- Use staged rollouts
- Monitor for issues
- Rollback if needed

## Troubleshooting

### Build Errors
```bash
# Clean build
cd android
./gradlew clean

# Clear Gradle cache
./gradlew clean --no-daemon

# Re-sync
cd ..
npx cap sync android
```

### Sync Issues
```bash
# Force sync
npx cap sync android --force

# Clear Capacitor cache
rm -rf .capacitor
npx cap sync android
```

### Plugin Issues
```bash
# Update Capacitor
npm install @capacitor/core@latest @capacitor/android@latest @capacitor/cli@latest

# Re-sync
npx cap sync android
```

## Best Practices

### 1. Version Management
- Use semantic versioning (1.0.0, 1.0.1, 1.1.0)
- Update version in capacitor.config.json
- Update version in android/app/build.gradle

### 2. Code Signing
- Never commit keystore to git
- Use different keystore for debug and release
- Store keystore password securely
- Use environment variables for passwords

### 3. Testing
- Test on multiple Android versions
- Test on different screen sizes
- Test on different devices
- Test with poor network conditions

### 4. Performance
- Use ProGuard/R8 for code shrinking
- Enable APK splitting
- Use App Bundle for smaller downloads
- Optimize images and assets

### 5. Security
- Use HTTPS for all API calls
- Validate SSL certificates
- Encrypt sensitive data
- Use Android Keystore for secrets

## Cost Summary

### Development Costs
- Google Play Developer Account: $25 (one-time)
- Android Studio: Free
- Testing devices: Varies

### Maintenance Costs
- Google Play Console: Free
- Hosting: Already paid (Vercel)
- Backend: Already paid (Supabase)

### Total Initial Cost: ~$25
### Total Monthly Cost: $0 (additional)

## Next Steps

1. Complete error handling implementation
2. Set up Redis caching
3. Integrate Sentry monitoring
4. Build and test Android app
5. Submit to Play Store
6. Monitor and optimize
