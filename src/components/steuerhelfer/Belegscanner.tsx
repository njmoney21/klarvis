export default function Belegscanner({ onApproved }: { onApproved: () => void }) {
  return (
    <button onClick={onApproved} className="text-gray-500 py-8 text-center block w-full">
      Belegscanner
    </button>
  )
}
