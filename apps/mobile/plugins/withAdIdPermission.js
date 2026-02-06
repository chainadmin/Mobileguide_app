const { withAndroidManifest } = require('expo/config-plugins');

const withAdIdPermission = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const adIdPermission = 'com.google.android.gms.permission.AD_ID';
    const hasAdId = manifest['uses-permission'].some(
      (perm) => perm.$?.['android:name'] === adIdPermission
    );

    if (!hasAdId) {
      manifest['uses-permission'].push({
        $: { 'android:name': adIdPermission },
      });
    }

    return config;
  });
};

module.exports = withAdIdPermission;
