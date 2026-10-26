'use client';

interface AccountActionsProps {
  saving: boolean;
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export default function AccountActions({
  saving,
  loading,
  onCancel,
  onSave,
}: AccountActionsProps) {
  return (
    <div
      className="
        mt-6
        flex
        flex-col-reverse
        gap-3
        border-t
        border-[#E2E2E7]
        pt-5

        sm:flex-row
        sm:items-center
        sm:justify-end
        sm:gap-3
        sm:pt-6

        md:mt-8
        md:gap-4
        md:pt-7
      "
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="
          mx-auto
          w-full
          max-w-[220px]
          rounded-lg
          border-2
          border-[#002B73]
          px-4
          py-2.5
          text-center
          text-[14px]
          font-semibold
          leading-tight
          text-[#002B73]
          transition-colors
          hover:bg-[#f0f4ff]
          disabled:cursor-not-allowed
          disabled:opacity-60

          sm:mx-0
          sm:w-auto
          sm:max-w-none
          sm:min-w-[120px]
          sm:px-5
          sm:text-[15px]

          md:min-w-[140px]
          md:px-6
          md:text-[16px]
        "
      >
        Cancel Changes
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || loading}
        className="
          mx-auto
          w-full
          max-w-[220px]
          rounded-lg
          bg-[#0040A1]
          px-4
          py-2.5
          text-center
          text-[14px]
          font-semibold
          leading-tight
          text-white
          shadow-[0px_20px_25px_-5px_rgba(0,64,161,0.25),0px_8px_10px_-6px_rgba(0,64,161,0.2)]
          transition-colors
          hover:bg-[#003285]
          disabled:cursor-not-allowed
          disabled:opacity-60

          sm:mx-0
          sm:w-auto
          sm:max-w-none
          sm:min-w-[150px]
          sm:px-5
          sm:text-[15px]

          md:min-w-[170px]
          md:px-6
          md:text-[16px]
        "
      >
        {saving ? 'Saving...' : 'Save Account Settings'}
      </button>
    </div>
  );
}