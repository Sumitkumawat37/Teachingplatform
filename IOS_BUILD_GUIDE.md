# iOS App Build Guide via Capacitor

## Prerequisites

### Required Software
1. **macOS** (latest version, macOS 13+ recommended)
2. **Xcode** (v15 or higher)
3. **Xcode Command Line Tools**
4. **CocoaPods** (latest version)
5. **Node.js** (v18 or higher)
6. **Apple Developer Account** ($99/year)

### Environment Setup
```bash
# Install Xcode from Mac App Store
# Install Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify installation
pod --version
xcodebuild -version
```

## Step 1: Install Dependencies

```bash
# Install Capacitor iOS
npm install @capacitor/ios

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

## Step 3: Add iOS Platform

```bash
# Add iOS platform
npx cap add ios

# Sync web assets to iOS
npx cap sync ios
```

## Step 4: Configure iOS App

### Update capacitor.config.json
```json
{
  "appId": "com.upscnadiya.app",
  "appName": "UPSC by Nadiya",
  "webDir": "dist",
  "server": {
    "iosScheme": "https",
    "iosContentInset": true,
    "iosAllowCustomContentInset": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "launchAutoHide": true,
      "backgroundColor": "#8B5CF6",
      "iosLaunchStoryboardName": "LaunchScreen",
      "iosLaunchStoryboardFile": "LaunchScreen.storyboard",
      "showSpinner": false
    },
    "LocalNotifications": {
      "smallIcon": "ic_stat_icon_config_sample",
      "iconColor": "#8B5CF6",
      "sound": "beep.wav"
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
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

## Step 5: Open in Xcode

```bash
# Open project in Xcode
npx cap open ios
```

## Step 6: Configure Xcode

### 1. Bundle Identifier
- Select project in navigator
- Select app target
- General → Bundle Identifier
- Set to: `com.upscnadiya.app`

### 2. Signing & Capabilities
- Add Apple Developer account
- Enable automatic signing
- Or use manual signing with provisioning profile

### 3. Capabilities
Add required capabilities:
- **Push Notifications**
- **Background Modes** (if needed)
- **App Groups** (if needed)

### 4. Info.plist Settings
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is needed for profile photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is needed for profile photos</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is needed for voice notes</string>
<key>UIFileSharingEnabled</key>
<true/>
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>www.upscwithnadiya.in</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <false/>
      <key>NSIncludesSubdomains</key>
      <true/>
    </dict>
  </dict>
</dict>
```

### 5. Launch Screen
- Create LaunchScreen.storyboard
- Add app logo and branding
- Set background color to #8B5CF6

## Step 7: Build for Testing

### Debug Build
```bash
# In Xcode, select connected device or simulator
# Press Cmd+R to build and run
```

### Release Build
```bash
# In Xcode, Product → Archive
# Select "Any iOS Device (arm64)"
# Product → Archive
```

## Step 8: Test the App

### Simulator Testing
```bash
# List available simulators
xcrun simctl list devices

# Launch specific simulator
open -a Simulator

# Run on simulator
npx cap run ios
```

### Device Testing
```bash
# Connect iOS device via USB
# Trust computer on device
# Select device in Xcode
# Press Cmd+R to build and run
```

### Test Checklist
- [ ] Login/Signup flow
- [ ] Course enrollment
- [ ] Video playback
- [ ] Payment flow
- [ ] Push notifications
- [ ] Offline mode
- [ ] Deep links
- [ ] App lifecycle (background/foreground)

## Step 9: App Store Submission

### 1. Create App Store Connect Account
- Go to https://appstoreconnect.apple.com
- Sign in with Apple Developer account
- Create new app

### 2. App Information
- **Platform**: iOS
- **Name**: UPSC by Nadiya
- **Primary Language**: English
- **Bundle ID**: com.upscnadiya.app
- **SKU**: UPSC-NADIYA-001

### 3. Upload Build
```bash
# In Xcode, Product → Archive
# Window → Organizer
- Select archive
- Click "Distribute App"
- Select "App Store Connect"
- Upload
```

### 4. App Store Information
- **Screenshots**: (6.7" and 5.5" iPhone, iPad Pro)
- **App Icon**: (1024x1024px)
- **Privacy Policy URL**: (your website)
- **Support URL**: (your website)
- **Marketing URL**: (optional)

### 5. Pricing & Availability
- **Price**: Free
- **Availability**: All countries
- **Content Rights**: Own all content

### 6. App Information
- **Name**: UPSC by Nadiya
- **Subtitle**: Expert UPSC Preparation
- **Description**: (use TERMS_OF_SERVICE.md content)
- **Keywords**: UPSC, IAS, Preparation, Education
- **Category**: Education

### 7. Age Rating
- Complete age rating questionnaire
- Select appropriate rating

### 8. Submit for Review
- Review takes 1-3 days
- Monitor status in App Store Connect
- Address any feedback

## Step 10: Post-Launch

### Monitor Performance
- Use App Store Connect analytics
- Track crash reports
- Monitor app ratings
- Track user reviews

### Update App
- Fix bugs
- Add features
- Update dependencies
- Increment version number
- Submit new build

### Rollback Plan
- Keep previous build version
- Use phased release
- Monitor for issues
- Rollback if needed

## Troubleshooting

### Build Errors
```bash
# Clean build folder
# In Xcode: Product → Clean Build Folder (Cmd+Shift+K)

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Re-sync
npx cap sync ios
```

### Pod Issues
```bash
# Update pods
cd ios
pod install
cd ..

# Clean pods
cd ios
pod deintegrate
pod install
cd ..
```

### Sync Issues
```bash
# Force sync
npx cap sync ios --force

# Clear Capacitor cache
rm -rf .capacitor
npx cap sync ios
```

### Signing Issues
```bash
# Reset signing
# In Xcode: 
# - Select project
# - Signing & Capabilities
# - Reset to automatic signing
# - Or re-add provisioning profile
```

## Best Practices

### 1. Version Management
- Use semantic versioning (1.0.0, 1.0.1, 1.1.0)
- Update version in capacitor.config.json
- Update version in Xcode project settings
- Update version in Info.plist

### 2. Code Signing
- Use automatic signing for development
- Use manual signing for production
- Store certificates securely
- Use different profiles for dev/prod

### 3. Testing
- Test on multiple iOS versions (iOS 15+)
- Test on different device sizes
- Test on iPhone and iPad
- Test with poor network conditions

### 4. Performance
- Use App Thinning
- Enable bitcode (if needed)
- Optimize images and assets
- Use lazy loading

### 5. Security
- Use HTTPS for all API calls
- Validate SSL certificates
- Use Keychain for secrets
- Enable App Transport Security

### 6. App Store Guidelines
- Follow Human Interface Guidelines
- Avoid rejected patterns
- Provide clear description
- Include proper screenshots
- Respond to reviews

## Cost Summary

### Development Costs
- Apple Developer Account: $99/year
- Mac hardware: Varies
- Testing devices: Varies

### Maintenance Costs
- App Store Connect: Free
- Hosting: Already paid (Vercel)
- Backend: Already paid (Supabase)

### Total Annual Cost: ~$99
### Total Monthly Cost: ~$8.25

## Comparison: Android vs iOS

| Aspect | Android | iOS |
|--------|---------|-----|
| Developer Account | $25 one-time | $99/year |
| Review Time | 1-3 days | 1-3 days |
| Build Tools | Android Studio (Free) | Xcode (Free, Mac only) |
| Testing | Easy (many devices) | Limited (Apple devices) |
| Market Share | ~70% global | ~28% global |
| Revenue | Lower average | Higher average |

## Next Steps

1. Complete error handling implementation
2. Set up Redis caching
3. Integrate Sentry monitoring
4. Build and test iOS app
5. Submit to App Store
6. Monitor and optimize

## Alternative: Cross-Platform Build Services

If you don't have Mac, consider:
- **Codemagic**: CI/CD for iOS builds
- **Bitrise**: CI/CD for iOS builds
- **AppCenter**: Microsoft's build service
- **Expo**: Alternative to Capacitor

These services can build iOS apps without a Mac.
