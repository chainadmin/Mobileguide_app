const { withAndroidManifest, withAppBuildGradle } = require('expo/config-plugins');

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
    const adServicesAdId = 'android.permission.ACCESS_ADSERVICES_AD_ID';
    const adServicesAttribution = 'android.permission.ACCESS_ADSERVICES_ATTRIBUTION';

    const permissionsToAdd = [
      { name: adIdPermission, toolsNode: 'replace' },
      { name: adServicesAdId, toolsNode: 'replace' },
      { name: adServicesAttribution, toolsNode: 'replace' },
    ];

    for (const perm of permissionsToAdd) {
      const existingIndex = manifest['uses-permission'].findIndex(
        (p) => p.$?.['android:name'] === perm.name
      );

      const entry = {
        $: {
          'android:name': perm.name,
          'tools:node': perm.toolsNode,
        },
      };

      if (existingIndex >= 0) {
        manifest['uses-permission'][existingIndex] = entry;
      } else {
        manifest['uses-permission'].push(entry);
      }
    }

    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const contents = config.modResults.contents;
      const postMergeTask = `
// Inject AD_ID permission AFTER Gradle manifest merger completes
import groovy.xml.XmlSlurper
import groovy.xml.XmlUtil

android.applicationVariants.configureEach { variant ->
    variant.outputs.each { output ->
        def processManifest = output.hasProperty("processManifestProvider") ?
            output.processManifestProvider.get() : output.processManifest
        processManifest.doLast { task ->
            def outDir = null
            if (task.hasProperty("manifestOutputDirectory")) {
                outDir = task.manifestOutputDirectory.get().asFile
            } else if (task.hasProperty("multiApkManifestOutputDirectory")) {
                outDir = task.multiApkManifestOutputDirectory.get().asFile
            }
            if (outDir == null) {
                outDir = new File(project.buildDir, "intermediates/merged_manifests/\${variant.name}")
            }
            def manifestFiles = []
            if (outDir.exists()) {
                outDir.eachFileRecurse { f ->
                    if (f.name == 'AndroidManifest.xml') {
                        manifestFiles.add(f)
                    }
                }
            }
            def bundleManifest = new File(project.buildDir, "intermediates/merged_manifests/\${variant.name}/AndroidManifest.xml")
            if (bundleManifest.exists() && !manifestFiles.contains(bundleManifest)) {
                manifestFiles.add(bundleManifest)
            }
            manifestFiles.each { manifestFile ->
                def xml = new XmlSlurper().parse(manifestFile)
                def adIdPerm = 'com.google.android.gms.permission.AD_ID'
                def hasAdId = xml.'uses-permission'.any { it.@'android:name' == adIdPerm }
                if (!hasAdId) {
                    xml.appendNode {
                        'uses-permission'('android:name': adIdPerm)
                    }
                    manifestFile.text = XmlUtil.serialize(xml)
                    println ">>> AD_ID permission injected into: \${manifestFile.path}"
                } else {
                    println ">>> AD_ID permission already in: \${manifestFile.path}"
                }
            }
        }
    }
}
`;
      if (!contents.includes('Inject AD_ID permission AFTER Gradle manifest merger')) {
        const cleaned = contents.replace(/\n\/\/ Force AD_ID permission[\s\S]*?adIdPermission[\s\S]*?\]\n/, '\n');
        config.modResults.contents = cleaned + '\n' + postMergeTask;
      }
    }
    return config;
  });

  return config;
};

module.exports = withAdIdPermission;
