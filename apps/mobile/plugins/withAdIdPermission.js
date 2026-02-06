const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

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

    const adIdPermission = 'com.google.android.gms.permission.AD_ID';

    const existingIndex = manifest['uses-permission'].findIndex(
      (perm) => perm.$?.['android:name'] === adIdPermission
    );

    const adIdEntry = {
      $: {
        'android:name': adIdPermission,
        'tools:node': 'merge',
      },
    };

    if (existingIndex >= 0) {
      manifest['uses-permission'][existingIndex] = adIdEntry;
    } else {
      manifest['uses-permission'].push(adIdEntry);
    }

    return config;
  });

  return config;
};

module.exports = withAdIdPermission;
