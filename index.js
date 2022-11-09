import { getInput, setOutput, setFailed } from '@actions/core';
import { Octokit } from "octokit";
import { fs } from "fs";

try {

    let dir = "./"
    const content = fs.readdirSync(dir, { withFileTypes: true });

    console.log(`get packages result: ${JSON.stringify(content, undefined, 2)}`);

    const token = getInput('package-token');
    const version = getInput('package-version');
    const packageType = "nuget"

    console.log(`Token ${token}`);
    console.log(`Version: ${version}`);


    const versionNumber = version.replace('v', '')

    console.log(`VersionPasrsed: ${versionNumber}`);

    const octokit = new Octokit({
        auth: `${token}`
    })




    const { data } = await octokit.request('GET /user/packages',
        {
            package_type: `${packageType}`
        });

    console.log(`get packages result: ${JSON.stringify(data, undefined, 2)}`);

    const packagesNames = data.map(x => x.name)

    setOutput("names", JSON.stringify(packagesNames, undefined, 2));

    packagesNames.forEach(async name => {

        const packageVersion = await octokit.request('GET /user/packages/{package_type}/{package_name}/versions', {
            package_type: `${packageType}`,
            package_name: `${name}`
        })

        if (packageVersion.status === 200) {
            console.log(`Package Version Result: ${JSON.stringify(packageVersion, undefined, 2)}`);

            const selectedPackageVersion = packageVersion.data.filter(x => x.name === versionNumber)

            if (selectedPackageVersion.length > 0) {
                var result = await octokit.request('DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}', {
                    package_type: `${packageType}`,
                    package_name: `${name}`,
                    package_version_id: selectedPackageVersion[0].id
                })

                console.log(`Delete result: ${JSON.stringify(result, undefined, 2)}`);
            } else {
                console.log(`Package: ${name} Version:${versionNumber}`);
            }
        }
    });

} catch (error) {
    setFailed(error.message);
}