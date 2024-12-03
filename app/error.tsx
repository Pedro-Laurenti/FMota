"use client";

import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		/* eslint-disable no-console */
		console.log(`Error: ${error}`);
	}, [error]);

	return (
		<div>
			<h2>Ops!</h2>
			<button
				onClick={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
        Recarregar
      </button>
		</div>
	);
}
