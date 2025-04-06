module.exports = {
  "expo": {
    "name": "Finanzas Inteligentes",
    "description": "Manage your money, your way.",
    "slug": "finanzas-ok",
    "version": "2.1.1",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "finanzasok",
    "platforms": [
      "android",
      "ios"
    ],
    "githubUrl": "https://github.com/soyalexrc/finanzas_ok",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "userInterfaceStyle": "light",
      "supportsTablet": true,
      "googleServicesFile": process.env.GOOGLE_SERVICES_INFO_PLIST ?? "./GoogleService-Info.plist",
      "usesAppleSignIn": true,
      "bundleIdentifier": "com.alexrc.finanzasok2404",
      "config": {
        "usesNonExemptEncryption": false
      },
      "entitlements": {
        "com.apple.developer.associated-domains": [
          "webcredentials:finanzas-ok-backend-589962407829.us-central1.run.app",
        ],
        "infoPlist": {
          "NSFaceIDUsageDescription": "Sign in securely with Face ID",
        },
      }
    },
    "android": {
      "userInterfaceStyle": "light",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.alexrc.finanzas_ok",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      "config": {
        "assetLinks": [
          {
            "namespace": "android_app",
            "package_name": "com.alexrc.finanzas_ok",
            "sha256_cert_fingerprints": [
              "F9:E0:9D:AC:92:29:62:59:57:91:E6:6A:79:41:A1:29:CD:71:A0:12:99:9B:DD:97:13:3C:31:58:E7:EE:83:2B"
            ]
          }
        ]
      },
      "intentFilters": [
        {
          "action": "android.intent.action.VIEW",
          "category": [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE"
          ],
          "data": {
            "scheme": "https",
            "host": "finanzas-ok-backend-589962407829.us-central1.run.app"
          }
        }
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "react-native-bottom-tabs",
      "expo-apple-authentication",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "expo-dev-launcher",
        {
          "launchMode": "most-recent"
        }
      ],
      "expo-localization",
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ],
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Development"
        }
      ],
      "expo-sqlite",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.589962407829-dq3il6oqlc97tstu2mvh8lgnfatgbvho"
        }
      ],
      [
        "expo-notifications",
        {
          "defaultChannel": "default"
        }
      ],
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "f3f3f3a8-d2ec-4088-ae83-cc81c8c47638"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/f3f3f3a8-d2ec-4088-ae83-cc81c8c47638",
      "fallbackToCacheTimeout": 1
    }
  }
}
