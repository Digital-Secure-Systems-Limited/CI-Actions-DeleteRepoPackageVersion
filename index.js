import { getInput, setOutput, setFailed } from '@actions/core';
import { Octokit } from "octokit";

try {
    // `who-to-greet` input defined in action metadata file
    const token = getInput('package-token');
    const version = getInput('package-version');
    const packageType = "nuget"

    const versionNumber = version.replace('v', '')

    const octokit = new Octokit({
        auth: `${token}`
    })

    const { data } = await octokit.request('GET /user/packages',
        {
            package_type: `${packageType}`
        });

    const packagesNames = data.map(x => x.name)

    setOutput("names", JSON.stringify(packagesNames, undefined, 2));

    packagesNames.forEach(async name => {

        const packageVersion = await octokit.request('GET /user/packages/{package_type}/{package_name}/versions', {
            package_type: `${packageType}`,
            package_name: `${name}`
        })

        if (packageVersion.status === 200) {
            const selectedPackageVersion = packageVersion.data.filter(x => x.name == versionNumber)
            console.log(`Selected package version: ${JSON.stringify(selectedPackageVersion, undefined, 2)}`);


            console.log(`Selected Package Version: ${JSON.stringify(selectedPackageVersion, undefined, 2)}`);
            console.log(`Selected Package Version Id: ${selectedPackageVersion[0].id}`);

            if (selectedPackageVersion) {
                var result = await octokit.request('DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}', {
                    package_type: `${packageType}`,
                    package_name: `${name}`,
                    package_version_id: selectedPackageVersion[0].id
                })

                console.log(`Delete result: ${JSON.stringify(result, undefined, 2)}`);
            }else   
            {
                console.log(`Package: ${name} Version:${versionNumber}`);
            }
        }
    });

} catch (error) {
    setFailed(error.message);
}