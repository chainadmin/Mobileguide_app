const { withAndroidManifest, withDangerousMod, withAppBuildGradle } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const AD_ID_PERM = 'com.google.android.gms.permission.AD_ID';

const withAdIdPermission = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.$) {
      manifest.$ = {};
    }
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = [
      AD_ID_PERM,
      'android.permission.ACCESS_ADSERVICES_AD_ID',
      'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
    ];

    for (const name of permissions) {
      const idx = manifest['uses-permission'].findIndex(
        (p) => p.$?.['android:name'] === name
      );
      const entry = { $: { 'android:name': name, 'tools:node': 'replace' } };
      if (idx >= 0) {
        manifest['uses-permission'][idx] = entry;
      } else {
        manifest['uses-permission'].push(entry);
      }
    }

    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const releaseDir = path.join(
        config.modRequest.platformProjectRoot,
        'app', 'src', 'release'
      );

      if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir, { recursive: true });
      }

      const releaseManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="${AD_ID_PERM}" />
    <uses-permission android:name="android.permission.ACCESS_ADSERVICES_AD_ID" />
    <uses-permission android:name="android.permission.ACCESS_ADSERVICES_ATTRIBUTION" />
</manifest>
`;

      fs.writeFileSync(
        path.join(releaseDir, 'AndroidManifest.xml'),
        releaseManifest
      );
      console.log('✅ Created release source set manifest with AD_ID permission');

      return config;
    },
  ]);

  return config;
};

module.exports = withAdIdPermission;
