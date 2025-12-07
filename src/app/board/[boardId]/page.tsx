import BoardPageClient from './BoardPageClient';

export default function BoardPage({ params }: { params: { boardId: string } }) {
  return <BoardPageClient boardId={params.boardId} />;
}
