//#region src/github-repository.ts
/** `owner/repo` of a GitHub origin (`https://[userinfo@]github.com/<owner>/<repo>[.git]`), or null
*  for no origin or another host. The userinfo, which may hold a secret placeholder, is skipped. */
function githubRepositoryOf(origin) {
	const match = /^https:\/\/(?:.*@)?github\.com\/([^/@]+)\/([^/@]+?)(?:\.git)?\/?$/.exec(origin || "");
	return match ? `${match[1]}/${match[2]}` : null;
}
//#endregion
export { githubRepositoryOf as t };
