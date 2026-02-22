const { withAndroidManifest } = require('expo/config-plugins');

const withRemoveAdId = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    androidManifest.manifest.$ = {
      ...androidManifest.manifest.$,
      'xmlns:tools': 'http://schemas.android.com/tools'
    };

    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    const existing = androidManifest.manifest['uses-permission'].find(
      (p) => p.$?.['android:name'] === 'com.google.android.gms.permission.AD_ID'
    );

    if (!existing) {
      androidManifest.manifest['uses-permission'].push({
        $: {
          'android:name': 'com.google.android.gms.permission.AD_ID',
          'tools:node': 'remove'
        }
      });
    } else {
      existing.$['tools:node'] = 'remove';
    }

    return config;
  });
};

module.exports = withRemoveAdId;
