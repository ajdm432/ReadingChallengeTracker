# Welcome to Reading Challenge Tracker

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Requirements

### Platform

Android only.
This is a hobby project designed for use on Android. There is currently no plan to support IOS devices.

### Settings

You will need to disable android's autoblocker to install the application. Follow the steps below:

1. Navigate to `Settings -> Security and privacy`
2. Find the `Auto Blocker` setting and toggle it off (you will need to pass a security check. Either use fingerprint or PIN authentication).
3. This will temporarily disable Auto Blocker. If you wish to permanently disable it, tap on the `Auto Blocker` setting and scroll down. Toggle off the `Turn on automatically` setting.
4. When you attempt to install the application, your phone will ask you to give your browser and/or file system application permissions to install unknown apps. Allow this.
5. Finally, `Play Protect` may attempt to prevent the unknown app installation. To bypass this warning tap `more details` and then `Install anyway`.

## Releases

Releases are not currently publicly available on Expo or app stores. If you want to use the app, the latest release can be installed here:

| Version                                                                                   |
| ----------------------------------------------------------------------------------------- |
| [v0.1.0](https://github.com/ajdm432/ReadingChallengeTracker/releases/tag/v0.1.0) (latest) |

## Developers

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Useful commands:

1. Create a new build: `eas build --platform <target platform> --profile <target profile>`
2. Update an existing Build: `eas update --branch <branch-name> --platform <target platform> --message "<your message>"`

## Attributions

- Application icon and favicon provided by flaticon.com user popo2021
- Splash screen art provided by pixabay.com user nathallie_art
