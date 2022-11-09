import { getInput, setOutput, setFailed } from '@actions/core';
import { Octokit } from "octokit";

try {

    const packageType = "nuget"
    const token = getInput('package-token');
    const version = getInput('package-version');
    const names = getInput('package-names');
    const versionNumber = version.replace('v', '')

    console.log(`Token ${token}`);
    console.log(`Version: ${version}`);
    console.log(`Names ${names}`);
    console.log(`VersionNumberParsed: ${versionNumber}`);

    const octokit = new Octokit({
        auth: `${token}`
    })

    const packagesNames = names.replace(' ', '').split(',');
    console.log(`Delete result: ${JSON.stringify(packagesNames, undefined, 2)}`);

    packagesNames.forEach(async name => {

        let trimedName = name.trim();
        console.log(`Trimmed name: ${trimedName}`);

        try {

            const packageVersion = await octokit.request('GET /orgs/Digital-Secure-Systems-Limited/packages/{package_type}/{package_name}/versions', {
                package_type: `${packageType}`,
                package_name: `${trimedName}`
            })

            if (packageVersion.status === 200) {
                console.log(`Package Version Result: ${JSON.stringify(packageVersion, undefined, 2)}`);
    
                const selectedPackageVersion = packageVersion.data.filter(x => x.name === versionNumber)
    
                if (selectedPackageVersion.length > 0) {
                    var result = await octokit.request('DELETE /orgs/Digital-Secure-Systems-Limited/packages/{package_type}/{package_name}/versions/{package_version_id}', {
                        package_type: `${packageType}`,
                        package_name: `${trimedName}`,
                        package_version_id: selectedPackageVersion[0].id
                    })
    
                    console.log(`Delete result: ${JSON.stringify(result, undefined, 2)}`);
                } else {
                    console.log(`Package: ${trimedName} Version:${versionNumber}`);
                }
            }

        } catch (error) {
        }





    });

} catch (error) {
    setFailed(error.message);
}