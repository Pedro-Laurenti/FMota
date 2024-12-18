"use client";

import { Button } from "@nextui-org/react";
import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
	}, [error]);

	return (
		<div className="w-screen h-screen flex flex-col justify-center items-center">
			<h2 className="text-2xl text-warning">Ops!</h2>
      <p className="text-lg mb-2">Ocorreu um erro ao carregar o conteúdo.</p>
			<Button
        color="warning"
				onPress={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}
			>
        Recarregar
      </Button>
		</div>
	);
}
