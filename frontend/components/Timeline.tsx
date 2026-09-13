import React from 'react';
import { motion } from 'framer-motion';

interface Scene {
  id: string;
  type: string;
  description: string;
  duration: number;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface TimelineProps {
  scenes: Scene[];
  selectedSceneId?: string;
  onSceneSelect: (sceneId: string) => void;
  onSceneRegenerate: (sceneId: string) => void;
  onSceneDelete: (sceneId: string) => void;
}

const sceneTypeEmojis: Record<string, string> = {
  intro: '📌',
  hero: '🎯',
  detail: '🔍',
  lifestyle: '🎨',
  benefit: '✨',
  cta: '🎬',
};

export const Timeline: React.FC<TimelineProps> = ({
  scenes,
  selectedSceneId,
  onSceneSelect,
  onSceneRegenerate,
  onSceneDelete,
}) => {
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  return (
    <motion.div
      className="card-dark space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-800">
        <h3 className="text-lg font-bold">Timeline Cảnh Quay</h3>
        <div className="text-sm text-gray-400">
          Tổng: <span className="text-primary-500 font-semibold">{totalDuration}s</span>
        </div>
      </div>

      {/* Scene Items */}
      {scenes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có cảnh quay nào. Hãy tải ảnh và tạo video!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedSceneId === scene.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-700 bg-dark-800/50 hover:bg-dark-800'
              }`}
              onClick={() => onSceneSelect(scene.id)}
            >
              {/* Scene Content */}
              <div className="flex items-start gap-3">
                {/* Thumbnail / Status */}
                <div className="relative flex-shrink-0 w-16 h-16 rounded-lg bg-dark-900 overflow-hidden flex items-center justify-center">
                  {scene.status === 'generating' && (
                    <motion.div
                      className="text-2xl"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.div>
                  )}
                  {scene.status === 'completed' && scene.videoUrl && (
                    <div className="text-2xl">▶️</div>
                  )}
                  {scene.status === 'failed' && (
                    <div className="text-2xl">❌</div>
                  )}
                  {scene.status === 'pending' && (
                    <div className="text-2xl">⭕</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{sceneTypeEmojis[scene.type] || '🎬'}</span>
                    <h4 className="font-semibold truncate">Cảnh {index + 1}: {scene.type}</h4>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{scene.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-dark-900 px-2 py-1 rounded">
                      {scene.duration}s
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        scene.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : scene.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : scene.status === 'generating'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {scene.status === 'generating' && 'Đang tạo...'}
                      {scene.status === 'completed' && 'Hoàn thành'}
                      {scene.status === 'failed' && 'Lỗi'}
                      {scene.status === 'pending' && 'Chờ xử lý'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 gap-2 hidden group-hover:flex flex-col">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSceneRegenerate(scene.id);
                    }}
                    className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors"
                    title="Tạo lại cảnh này"
                  >
                    🔄
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSceneDelete(scene.id);
                    }}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    title="Xóa cảnh này"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline Visual */}
      {scenes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dark-700">
          <div className="flex items-center h-8 bg-dark-900 rounded-lg overflow-hidden">
            {scenes.map((scene) => (
              <motion.div
                key={scene.id}
                className={`h-full flex items-center justify-center text-xs font-bold text-white transition-colors ${
                  scene.status === 'completed'
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600'
                    : scene.status === 'generating'
                    ? 'bg-blue-600 animate-pulse'
                    : scene.status === 'failed'
                    ? 'bg-red-600'
                    : 'bg-gray-600'
                }`}
                style={{
                  width: `${(scene.duration / totalDuration) * 100}%`,
                }}
                title={`${scene.type} - ${scene.duration}s`}
              >
                {scene.duration > 3 && `${scene.duration}s`}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
