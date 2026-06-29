'use client';

import { useState, useActionState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Loader2, X } from 'lucide-react';
import { saveDestination } from '@/lib/actions/destinations';
import { generateDestinationSEO, generateDestinationDescription } from '@/lib/actions/seo-generator';
import { slugify } from '@/lib/slugify';
import SimpleUploadButton from '@/components/admin/SimpleUploadButton';
import Link from 'next/link';

const TinyMCEEditor = dynamic(() => import('@/components/TinyMCEEditor'), { ssr: false });

const initialState = { error: null };

export default function DestinationForm({ destination, allDestinations = [] }) {
  const isEdit = !!destination;

  const [name, setName] = useState(destination?.name || '');
  const [slug, setSlug] = useState(destination?.slug || '');
  const [tagline, setTagline] = useState(destination?.tagline || '');
  const [description, setDescription] = useState(destination?.description || '');
  const [heroImage, setHeroImage] = useState(destination?.heroImage || '');
  const [isActive, setIsActive] = useState(destination?.isActive ?? true);
  const [parentSlug, setParentSlug] = useState(destination?.parentSlug || '');

  const [seoTitle, setSeoTitle] = useState(destination?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(destination?.seoDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(destination?.focusKeyword || '');
  const [keywordsInput, setKeywordsInput] = useState((destination?.keywords || []).join(', '));
  const [longTailKeywords, setLongTailKeywords] = useState(destination?.longTailKeywords || []);
  const [newLongTail, setNewLongTail] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [genDescError, setGenDescError] = useState('');

  const [state, formAction, isPending] = useActionState(saveDestination, initialState);

  const handleNameChange = (val) => {
    setName(val);
    if (!isEdit) setSlug(slugify(val));
  };

  const handleGenerateSEO = async () => {
    if (!name) { setGenError('Enter a destination name first.'); return; }
    setGenError('');
    setIsGenerating(true);
    const res = await generateDestinationSEO({ name, tagline, description });
    setIsGenerating(false);
    if (res.success) {
      setSeoTitle(res.data.seoTitle || '');
      setSeoDescription(res.data.seoDescription || '');
      setFocusKeyword(res.data.focusKeyword || '');
      setKeywordsInput((res.data.keywords || []).join(', '));
      setLongTailKeywords(res.data.longTailKeywords || []);
    } else {
      setGenError(res.error || 'Generation failed.');
    }
  };

  const handleGenerateDescription = async () => {
    if (!name) { setGenDescError('Enter a destination name first.'); return; }
    if (description && !confirm('This will replace your current description. Continue?')) return;
    setGenDescError('');
    setIsGeneratingDesc(true);
    const parentName = parentSlug
      ? (allDestinations.find(d => d.slug === parentSlug)?.name || '')
      : '';
    const res = await generateDestinationDescription({ name, tagline, parentName });
    setIsGeneratingDesc(false);
    if (res.success) {
      setDescription(res.html);
    } else {
      setGenDescError(res.error || 'Generation failed.');
    }
  };

  const removeLongTail = (idx) => setLongTailKeywords(lts => lts.filter((_, i) => i !== idx));

  const addLongTail = () => {
    const trimmed = newLongTail.trim();
    if (trimmed && !longTailKeywords.includes(trimmed)) {
      setLongTailKeywords(lts => [...lts, trimmed]);
      setNewLongTail('');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form action={formAction} className="space-y-8 max-w-4xl">
      {/* Hidden fields */}
      {isEdit && <input type="hidden" name="id" value={destination._id} />}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="heroImage" value={heroImage} />
      <input type="hidden" name="isActive" value={String(isActive)} />
      <input type="hidden" name="longTailKeywords" value={longTailKeywords.join('\n')} />
      <input type="hidden" name="parentSlug" value={parentSlug} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{state.error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-base">Basic Information</h2>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Destination Name <span className="text-red-500">*</span></label>
            <input
              name="name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className={inputClass}
              placeholder="e.g. Sikkim"
              required
            />
          </div>
          <div>
            <label className={labelClass}>URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">/destination/</span>
              <input
                name="slug"
                value={slug}
                onChange={e => setSlug(slugify(e.target.value))}
                className={inputClass}
                placeholder="sikkim"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tagline</label>
          <input
            name="tagline"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className={inputClass}
            placeholder="e.g. The Land of Mystic Mountains"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className={labelClass + ' mb-0'}>Status</label>
          <button
            type="button"
            onClick={() => setIsActive(a => !a)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-muted'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-muted-foreground">{isActive ? 'Live (visible on site)' : 'Hidden'}</span>
        </div>

        {allDestinations.length > 0 && (
          <div>
            <label className={labelClass}>Parent Destination <span className="text-muted-foreground font-normal">(optional — for city-level pages)</span></label>
            <select
              value={parentSlug}
              onChange={e => setParentSlug(e.target.value)}
              className={inputClass}
            >
              <option value="">— None (this is a region/country-level page) —</option>
              {allDestinations.map(d => (
                <option key={d._id} value={d.slug}>{d.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {parentSlug
                ? `This will appear as a city inside "${allDestinations.find(d => d.slug === parentSlug)?.name}". URL hierarchy: /${allDestinations.find(d => d.slug === parentSlug)?.slug} → /${slug || name.toLowerCase()}`
                : 'Leave empty if this is a top-level region like "Sikkim" or "Rajasthan".'}
            </p>
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-base">Hero Image</h2>
        <div className="flex items-center gap-4">
          <SimpleUploadButton
            label={heroImage ? 'Change image' : 'Upload hero image'}
            onUpload={url => setHeroImage(url)}
          />
          {heroImage && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-border">
              <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setHeroImage('')}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-base">Description</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured guide with About, Best Time, How to Reach, Things to Do, Travel Tips sections — this is your main SEO content.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDesc}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60 whitespace-nowrap"
            >
              {isGeneratingDesc ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Writing…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate description</>
              )}
            </button>
            {genDescError && <p className="text-xs text-red-600 text-right">{genDescError}</p>}
            {!genDescError && <p className="text-xs text-muted-foreground">~700 words · claude-haiku-4-5</p>}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-border">
          <TinyMCEEditor
            value={description}
            onEditorChange={val => setDescription(val)}
            height={500}
          />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base">SEO Metadata</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill manually or use the AI generator below</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleGenerateSEO}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate with AI</>
              )}
            </button>
            {genError && <p className="text-xs text-red-600">{genError}</p>}
            {!genError && <p className="text-xs text-muted-foreground">claude-haiku-4-5</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            SEO Title <span className="text-muted-foreground font-normal">({seoTitle.length}/60 chars)</span>
          </label>
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
            className={inputClass}
            maxLength={70}
            placeholder="Explore Sikkim | Hotels, Resorts & Tour Packages | QuickTrails"
          />
        </div>

        <div>
          <label className={labelClass}>
            Meta Description <span className="text-muted-foreground font-normal">({seoDescription.length}/160 chars)</span>
          </label>
          <textarea
            name="seoDescription"
            value={seoDescription}
            onChange={e => setSeoDescription(e.target.value)}
            rows={3}
            maxLength={170}
            className={inputClass}
            placeholder="Discover the best hotels and tour packages in Sikkim. Book verified stays in Gangtok and Pelling with QuickTrails."
          />
        </div>

        <div>
          <label className={labelClass}>Focus Keyword</label>
          <input
            name="focusKeyword"
            value={focusKeyword}
            onChange={e => setFocusKeyword(e.target.value)}
            className={inputClass}
            placeholder="e.g. Sikkim tour packages"
          />
        </div>

        <div>
          <label className={labelClass}>Keywords <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
          <input
            name="keywords"
            value={keywordsInput}
            onChange={e => setKeywordsInput(e.target.value)}
            className={inputClass}
            placeholder="Sikkim hotels, Sikkim resorts, Sikkim travel, Gangtok tour"
          />
        </div>

        <div>
          <label className={labelClass}>Long-tail Keywords</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {longTailKeywords.map((kw, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-800 border border-violet-200 text-xs rounded-full">
                {kw}
                <button type="button" onClick={() => removeLongTail(i)} className="hover:text-red-600 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLongTail}
              onChange={e => setNewLongTail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLongTail(); } }}
              className={inputClass}
              placeholder="Add a long-tail keyword and press Enter"
            />
            <button type="button" onClick={addLongTail} className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition">Add</button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Update destination' : 'Create destination'}
        </button>
        <Link href="/waypoint/destinations" className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition">Cancel</Link>
      </div>
    </form>
  );
}
