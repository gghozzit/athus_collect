import { RainDataForm } from "@/app/components/DataForm"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Input Data Athus</h1>
      <RainDataForm />
    </main>
  )
}

