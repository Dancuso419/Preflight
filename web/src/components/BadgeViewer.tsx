// TRD 4.3 — Badge Viewer
interface Props {
  txHash: string;
  tokenId: string;
  explorerLink: string;
  score: number;
}

export function BadgeViewer({ txHash, tokenId, explorerLink, score }: Props) {
  // TODO: shareable card, explorer link
  return (
    <div>
      <h2>PreFlight Ready Badge Minted</h2>
      <p>Token: {tokenId}</p>
      <p>Score: {score}</p>
      <a href={explorerLink} target="_blank" rel="noreferrer">View on Explorer</a>
    </div>
  );
}
