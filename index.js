import { getInput, setOutput, setFailed } from '@actions/core';
import { Octokit } from "octokit";

try {
    // `who-to-greet` input defined in action metadata file
    const token = getInput('package-token');
    //const version = getInput('package-version');
    const packageType = "nuget"

    const octokit = new Octokit({
        auth: `${token}`
    })

    const { data } = await octokit.request('GET /user/packages',
        {
            package_type: `${packageType}`
        });

    const packagesNames = data.map(x => x.name)

    console.log(`The event payload: ${JSON.stringify(data, undefined, 2)}`);

    setOutput("names", JSON.stringify(packagesNames, undefined, 2));

    //packagesNames.forEach(async name => {

    //    const packageVersion = await octokit.request('GET /user/packages/{package_type}/{package_name}/versions', {
    //        package_type: `${packageType}`,
    //        package_name: `${name}`
    //    })
    //    console.log(`The event payload: ${JSON.stringify(packageVersion, undefined, 2)}`);
    //});

} catch (error) {

    setFailed(error.message);

}